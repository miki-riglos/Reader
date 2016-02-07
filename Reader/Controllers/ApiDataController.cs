using Reader.DataService;
using Reader.ViewModels;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace Reader.Controllers {

    [Authorize]
    public class ApiDataController : ApiController {

        ReaderDataService readerDataService = new ReaderDataService();

        [Route("api/Subscription")]
        [HttpPost]
        public SubscriptionViewModel AddSubscription([FromBody]AddSubscriptionViewModel addSubscriptionViewModel) {
            var subscription = readerDataService.AddSubscription(User.Identity.Name, addSubscriptionViewModel.FeedUrl);

            var subscriptionViewModel = new SubscriptionViewModel(subscription);
            
            return subscriptionViewModel;
        }

        [Route("api/Subscription/{subscriptionId}/refresh")]
        [HttpPost]
        public SubscriptionViewModel RefreshSubscription(int subscriptionId) {
            var subscription = readerDataService.RefreshSubscription(User.Identity.Name, subscriptionId);

            var subscriptionViewModel = new SubscriptionViewModel(subscription);

            return subscriptionViewModel;
        }

        [Route("api/Subscription/{subscriptionId}/items")]
        [HttpGet]
        public List<SubscriptionItemViewModel> LoadSubscriptionItems(int subscriptionId, int skip) {
            var subscriptionItems = readerDataService.LoadSubscriptionItems(User.Identity.Name, subscriptionId, skip);

            var subscriptionItemsViewModel = subscriptionItems.Select(ufi => new SubscriptionItemViewModel(ufi)).ToList();

            return subscriptionItemsViewModel;
        }

        [Route("api/Subscription/{subscriptionId}")]
        [HttpDelete]
        public int DeleteSubscription(int subscriptionId) {
            var deleteResult = readerDataService.DeleteSubscription(User.Identity.Name, subscriptionId);
            return deleteResult;
        }

        [Route("api/SubscriptionItem")]
        [HttpPut]
        public SubscriptionItemViewModel UpdateSubscriptionItem([FromBody]SubscriptionItemViewModel subscriptionItemViewModel) {
            var subscriptionItem = readerDataService.UpdateSubscriptionItem(User.Identity.Name, subscriptionItemViewModel);

            var updatedSubscriptionViewModel = new SubscriptionItemViewModel(subscriptionItem);

            return updatedSubscriptionViewModel;
        }
    }
}