using Reader.Entities;
using Reader.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.ServiceModel.Syndication;
using System.Xml;

namespace Reader.DataService {

    public class ReaderDataService : IDisposable {

        private const int PAGE_ROWS = 30;

        private ReaderContext _readerContext = new ReaderContext();

        private Feed loadFeed(string feedUrl) {
            var feed = new Feed();
            var loadTime = DateTimeOffset.Now;

            using (var reader = XmlReader.Create(feedUrl)) {
                var syndicationFeed = SyndicationFeed.Load(reader);
                feed.Url = feedUrl;
                feed.Title = syndicationFeed.Title == null ? "Untitled" : syndicationFeed.Title.Text;
                feed.ImageUrl = syndicationFeed.ImageUrl == null ? null : syndicationFeed.ImageUrl.OriginalString;
                feed.LastUpdatedTime = syndicationFeed.LastUpdatedTime;
                feed.LoadTime = loadTime;

                feed.Items = syndicationFeed.Items.Reverse().Select(i => new FeedItem() {
                    Url = i.Links.Last().Uri.OriginalString,
                    Title = i.Title.Text,
                    PublishDate = i.PublishDate > DateTimeOffset.MinValue ? i.PublishDate : i.LastUpdatedTime,
                    LoadTime = loadTime
                }).ToList();
            }

            return feed;
        }

        private void refreshFeed(int feedId) {
            var feedToUpdate = _readerContext.Feeds.First(f => f.FeedId == feedId);
            var freshFeed = loadFeed(feedToUpdate.Url);

            feedToUpdate.Title = freshFeed.Title;
            feedToUpdate.ImageUrl = freshFeed.ImageUrl;
            feedToUpdate.LoadTime = freshFeed.LoadTime;

            foreach (var feedItem in freshFeed.Items) {
                if (!_readerContext.FeedItems.Any(fi => fi.Url == feedItem.Url)) {
                    feedItem.FeedId = feedToUpdate.FeedId;
                    _readerContext.FeedItems.Add(feedItem);
                }
            }

            _readerContext.SaveChanges();
        }

        public List<UserFeed> GetUserFeeds(string userName) {
            var userFeeds = _readerContext.UserFeeds
                                            .Include(uf => uf.Feed)
                                            .Where(uf => uf.UserName == userName)
                                            .ToList();

            foreach (var userFeed in userFeeds) {
                userFeed.Items = _readerContext.UserFeedItems
                                                .Include(ufi => ufi.FeedItem)
                                                .Where(ufi => ufi.UserFeedId == userFeed.UserFeedId)
                                                .OrderByDescending(ufi => ufi.FeedItemId)
                                                .Take(PAGE_ROWS)
                                                .ToList();
            }

            return userFeeds;
        }

        public UserFeed AddUserFeed(string userName, string feedUrl) {
            // load or create feed
            var feed = _readerContext.Feeds.Include(f => f.Items).FirstOrDefault(f => f.Url == feedUrl);
            if (feed == null) {
                feed = loadFeed(feedUrl);
                _readerContext.Feeds.Add(feed);
                _readerContext.SaveChanges();
            }

            // create user feed, if not exists
            var userFeed = _readerContext.UserFeeds.FirstOrDefault(uf => uf.UserName == userName && uf.FeedId == feed.FeedId);
            if (userFeed != null) {
                throw new ApplicationException("User Feed already exists.");
            }
            userFeed = new UserFeed() {
                UserName = userName,
                Feed = feed,
                Items = feed.Items.Select(i => new UserFeedItem() {
                    FeedItemId = i.FeedItemId,
                    IsRead = false
                }).ToList()
            };

            _readerContext.UserFeeds.Add(userFeed);
            _readerContext.SaveChanges();

            // order and limit items
            userFeed.Items = userFeed.Items
                                .OrderByDescending(ufi => ufi.FeedItemId)
                                .Take(PAGE_ROWS)
                                .ToList();

            return userFeed;
        }

        public UserFeed RefreshUserFeed(string userName, int userFeedId) {
            var userFeed = _readerContext.UserFeeds
                                            .Include(uf => uf.Items)
                                            .First(uf => uf.UserFeedId == userFeedId);
                
            if (userFeed.UserName != userName) {
                throw new ApplicationException("Invalid User Feed Id.");
            }

            // refresh feed
            refreshFeed(userFeed.FeedId);

            // insert new user feed items 
            var recentFeedItems = _readerContext
                                    .FeedItems
                                    .Where(fi => fi.FeedId == userFeed.FeedId)
                                    .Where(fi => !_readerContext.UserFeedItems
                                                                .Where(ufi => ufi.UserFeedId == userFeedId)
                                                                .Select(ufi => ufi.FeedItemId)
                                                                .Contains(fi.FeedItemId));
            foreach (var recentFeedItem in recentFeedItems) {
                var userFeedItem = new UserFeedItem();
                userFeedItem.UserFeedId = userFeedId;
                userFeedItem.FeedItemId = recentFeedItem.FeedItemId;
                userFeedItem.IsRead = false;
                _readerContext.UserFeedItems.Add(userFeedItem);
            }
            _readerContext.SaveChanges();

            // re-load user feed with fresh items
            userFeed = _readerContext.UserFeeds
                                        .Include(uf => uf.Feed)
                                        .First(uf => uf.UserFeedId == userFeedId);

            userFeed.Items = _readerContext.UserFeedItems
                                            .Include(ufi => ufi.FeedItem)
                                            .Where(ufi => ufi.UserFeedId == userFeed.UserFeedId)
                                            .OrderByDescending(ufi => ufi.FeedItemId)
                                            .Take(PAGE_ROWS)
                                            .ToList();

            return userFeed;
        }

        public List<UserFeedItem> LoadUserFeedItems(string userName, int userFeedId, int skip) {
            var userFeedItems = _readerContext.UserFeedItems
                                                .Include(ufi => ufi.FeedItem.Feed)
                                                .Where(ufi => ufi.UserFeedId == userFeedId)
                                                .OrderByDescending(ufi => ufi.FeedItemId)
                                                .Skip(skip)
                                                .Take(PAGE_ROWS)
                                                .ToList();
            return userFeedItems;
        }

        public int DeleteUserFeed(string userName, int userFeedId) {
            var userFeed = _readerContext.UserFeeds.Include(uf => uf.Items).First(uf => uf.UserFeedId == userFeedId);
                
            if (userFeed.UserName != userName) {
                throw new ApplicationException("Invalid User Feed Id.");
            }

            _readerContext.UserFeeds.Remove(userFeed);
            var deleteResult = _readerContext.SaveChanges();

            return deleteResult;
        }

        public UserFeedItem UpdateUserFeedItem(string userName, UserFeedItemViewModel userFeedItemViewModel) {
            var userFeedItem = _readerContext.UserFeedItems
                                                .Include(ufi => ufi.FeedItem.Feed)
                                                .Include(ufi => ufi.UserFeed)
                                                .First(ufi => ufi.UserFeedItemId == userFeedItemViewModel.UserFeedItemId);

            if (userFeedItem.UserFeed.UserName != userName) {
                throw new ApplicationException("Invalid User Feed Item.");
            }

            userFeedItem.IsRead = userFeedItemViewModel.IsRead;
            _readerContext.SaveChanges();

            return userFeedItem;
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