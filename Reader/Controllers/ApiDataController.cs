using Reader.DataService;
using Reader.ViewModels;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace Reader.Controllers {

    [Authorize]
    public class ApiDataController : ApiController {

        ReaderDataService readerDataService = new ReaderDataService();

        [Route("api/Subscription")]
        [HttpPost]
        public async Task<SubscriptionViewModel> AddSubscription([FromBody]AddSubscriptionViewModel addSubscriptionViewModel) {
            var subscription = await readerDataService.AddSubscriptionAsync(User.Identity.Name, addSubscriptionViewModel.FeedUrl);

            var subscriptionViewModel = new SubscriptionViewModel(subscription);
            
            return subscriptionViewModel;
        }

        [Route("api/Subscription/{subscriptionId}/refresh")]
        [HttpPost]
        public async Task<SubscriptionViewModel> RefreshSubscription(int subscriptionId) {
            var subscription = await readerDataService.RefreshSubscriptionAsync(User.Identity.Name, subscriptionId);

            var subscriptionViewModel = new SubscriptionViewModel(subscription);

            return subscriptionViewModel;
        }

        [Route("api/Subscription/{subscriptionId}/items")]
        [HttpGet]
        public async Task<List<SubscriptionItemViewModel>> LoadSubscriptionItems(int subscriptionId, int skip) {
            var subscriptionItems = await readerDataService.LoadSubscriptionItemsAsync(User.Identity.Name, subscriptionId, skip);

            var subscriptionItemsViewModel = subscriptionItems.Select(ufi => new SubscriptionItemViewModel(ufi)).ToList();

            return subscriptionItemsViewModel;
        }

        [Route("api/Subscription/{subscriptionId}")]
        [HttpDelete]
        public async Task<int> DeleteSubscription(int subscriptionId) {
            var deleteResult = await readerDataService.DeleteSubscription(User.Identity.Name, subscriptionId);
            return deleteResult;
        }

        [Route("api/SubscriptionItem")]
        [HttpPut]
        public async Task<SubscriptionItemViewModel> UpdateSubscriptionItem([FromBody]SubscriptionItemViewModel subscriptionItemViewModel) {
            var subscriptionItem = await readerDataService.UpdateSubscriptionItemAsync(User.Identity.Name, subscriptionItemViewModel);

            var updatedSubscriptionViewModel = new SubscriptionItemViewModel(subscriptionItem);

            return updatedSubscriptionViewModel;
        }
    }
}