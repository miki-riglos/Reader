using Reader.Entities;
using Reader.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Xml;

namespace Reader.DataService {

    public class ReaderDataService : IDisposable {

        private const int PAGE_ROWS = 30;

        private ReaderContext _readerContext = new ReaderContext();

        // Syndication doesn't have async methods
        private Feed loadFeed(string feedUrl) {
            var feed = new Feed();
            var loadTime = DateTimeOffset.Now;

            Func<SyndicationItem, string> getItemUrl = (item) => {
                Uri itemUri;
                var alternateLink = item.Links.FirstOrDefault(link => link.RelationshipType == null || link.RelationshipType.Equals("alternate", StringComparison.OrdinalIgnoreCase));
                if (alternateLink != null) {
                    itemUri = alternateLink.Uri;
                }
                else {
                    itemUri = new Uri(item.Id, UriKind.Absolute);
                }
                return itemUri.ToString();
            };

            using (var reader = XmlReader.Create(feedUrl)) {
                var syndicationFeed = SyndicationFeed.Load(reader);
                feed.Url = feedUrl;
                feed.Title = syndicationFeed.Title == null ? "Untitled" : syndicationFeed.Title.Text;
                feed.ImageUrl = syndicationFeed.ImageUrl == null ? null : syndicationFeed.ImageUrl.OriginalString;
                feed.LastUpdatedTime = syndicationFeed.LastUpdatedTime;
                feed.LoadTime = loadTime;

                feed.Items = syndicationFeed.Items.Reverse().Select(item => new FeedItem() {
                    Url = getItemUrl(item),
                    Title = item.Title.Text,
                    PublishDate = item.PublishDate > DateTimeOffset.MinValue ? item.PublishDate : item.LastUpdatedTime,
                    LoadTime = loadTime
                }).ToList();
            }

            return feed;
        }

        private async Task refreshFeedAsync(int feedId) {
            var feedToUpdate = await _readerContext.Feeds.FirstAsync(f => f.FeedId == feedId);
            var freshFeed = loadFeed(feedToUpdate.Url);

            feedToUpdate.Title = freshFeed.Title;
            feedToUpdate.ImageUrl = freshFeed.ImageUrl;
            feedToUpdate.LoadTime = freshFeed.LoadTime;

            foreach (var feedItem in freshFeed.Items) {
                if (!(await _readerContext.FeedItems.AnyAsync(fi => fi.FeedId == feedToUpdate.FeedId && fi.Url == feedItem.Url))) {
                    feedItem.FeedId = feedToUpdate.FeedId;
                    _readerContext.FeedItems.Add(feedItem);
                }
            }

            await _readerContext.SaveChangesAsync();
        }

        public async Task<List<Subscription>> GetSubscriptionsAsync(string userName) {
            var subscriptions = await _readerContext.Subscriptions
                                                    .Include(uf => uf.Feed)
                                                    .Where(uf => uf.UserName == userName)
                                                    .ToListAsync();

            foreach (var subscription in subscriptions) {
                subscription.Items = await _readerContext.SubscriptionItems
                                                        .Include(ufi => ufi.FeedItem)
                                                        .Where(ufi => ufi.SubscriptionId == subscription.SubscriptionId)
                                                        .OrderByDescending(ufi => ufi.FeedItemId)
                                                        .Take(PAGE_ROWS)
                                                        .ToListAsync();
            }

            return subscriptions;
        }

        public async Task<Subscription> AddSubscriptionAsync(string userName, string feedUrl) {
            // load or create feed
            var feed = await _readerContext.Feeds.Include(f => f.Items).FirstOrDefaultAsync(f => f.Url == feedUrl);
            if (feed == null) {
                feed = loadFeed(feedUrl);
                _readerContext.Feeds.Add(feed);
                _readerContext.SaveChanges();
            }

            // create subscription, if not exists
            var subscription = await _readerContext.Subscriptions.FirstOrDefaultAsync(uf => uf.UserName == userName && uf.FeedId == feed.FeedId);
            if (subscription != null) {
                throw new ApplicationException("Subscription already exists.");
            }
            subscription = new Subscription() {
                UserName = userName,
                Feed = feed,
                Items = feed.Items.Select(i => new SubscriptionItem() {
                    FeedItemId = i.FeedItemId,
                    IsRead = false
                }).ToList()
            };

            _readerContext.Subscriptions.Add(subscription);
            await _readerContext.SaveChangesAsync();

            // order and limit items
            subscription.Items = subscription.Items
                                                .OrderByDescending(ufi => ufi.FeedItemId)
                                                .Take(PAGE_ROWS)
                                                .ToList();

            return subscription;
        }

        public async Task<Subscription> RefreshSubscriptionAsync(string userName, int subscriptionId) {
            var subscription = await _readerContext.Subscriptions
                                                    .Include(uf => uf.Items)
                                                    .FirstAsync(uf => uf.SubscriptionId == subscriptionId);
                
            if (subscription.UserName != userName) {
                throw new ApplicationException("Invalid Subscription Id.");
            }

            // refresh feed
            await refreshFeedAsync(subscription.FeedId);

            // insert new subscription items 
            var recentFeedItems = await _readerContext
                                                .FeedItems
                                                .Where(fi => fi.FeedId == subscription.FeedId)
                                                .Where(fi => !_readerContext.SubscriptionItems
                                                                            .Where(ufi => ufi.SubscriptionId == subscriptionId)
                                                                            .Select(ufi => ufi.FeedItemId)
                                                                            .Contains(fi.FeedItemId))
                                                .ToListAsync();
            foreach (var recentFeedItem in recentFeedItems) {
                var subscriptionItem = new SubscriptionItem();
                subscriptionItem.SubscriptionId = subscriptionId;
                subscriptionItem.FeedItemId = recentFeedItem.FeedItemId;
                subscriptionItem.IsRead = false;
                _readerContext.SubscriptionItems.Add(subscriptionItem);
            }
            await _readerContext.SaveChangesAsync();

            // re-load subscription with fresh items
            subscription = await _readerContext.Subscriptions
                                                .Include(uf => uf.Feed)
                                                .FirstAsync(uf => uf.SubscriptionId == subscriptionId);

            subscription.Items = await _readerContext.SubscriptionItems
                                                        .Include(ufi => ufi.FeedItem)
                                                        .Where(ufi => ufi.SubscriptionId == subscription.SubscriptionId)
                                                        .OrderByDescending(ufi => ufi.FeedItemId)
                                                        .Take(PAGE_ROWS)
                                                        .ToListAsync();

            return subscription;
        }

        public async Task<List<SubscriptionItem>> LoadSubscriptionItemsAsync(string userName, int subscriptionId, int skip) {
            var subscriptionItems = await _readerContext.SubscriptionItems
                                                        .Include(ufi => ufi.FeedItem.Feed)
                                                        .Where(ufi => ufi.SubscriptionId == subscriptionId)
                                                        .OrderByDescending(ufi => ufi.FeedItemId)
                                                        .Skip(skip)
                                                        .Take(PAGE_ROWS)
                                                        .ToListAsync();
            return subscriptionItems;
        }

        public async Task<int> DeleteSubscription(string userName, int subscriptionId) {
            var subscription = await _readerContext.Subscriptions.Include(uf => uf.Items).FirstAsync(uf => uf.SubscriptionId == subscriptionId);
                
            if (subscription.UserName != userName) {
                throw new ApplicationException("Invalid Subscription Id.");
            }

            _readerContext.Subscriptions.Remove(subscription);
            var deleteResult = await _readerContext.SaveChangesAsync();

            return deleteResult;
        }

        public async Task<SubscriptionItem> UpdateSubscriptionItemAsync(string userName, SubscriptionItemViewModel subscriptionItemViewModel) {
            var subscriptionItem = await _readerContext.SubscriptionItems
                                                        .Include(ufi => ufi.FeedItem.Feed)
                                                        .Include(ufi => ufi.Subscription)
                                                        .FirstAsync(ufi => ufi.SubscriptionItemId == subscriptionItemViewModel.SubscriptionItemId);

            if (subscriptionItem.Subscription.UserName != userName) {
                throw new ApplicationException("Invalid Subscription Item.");
            }

            subscriptionItem.IsRead = subscriptionItemViewModel.IsRead;
            await _readerContext.SaveChangesAsync();

            return subscriptionItem;
        }

        // IDisposable implementation
        private bool disposed = false;

        protected virtual void Dispose(bool disposing) {
            if (!this.disposed) {
                if (disposing) {
                    _readerContext.Dispose();
                }
            }
            this.disposed = true;
        }

        public void Dispose() {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}