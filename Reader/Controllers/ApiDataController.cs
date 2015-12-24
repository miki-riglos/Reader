using Reader.DataService;
using Reader.Entities;
using Reader.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Reader.Controllers {

    [Authorize]
    public class ApiDataController : ApiController {

        ReaderDataService readerDataService = new ReaderDataService();

        [Route("api/UserFeed")]
        [HttpPost]
        public UserFeedViewModel AddUserFeed([FromBody]AddUserFeedViewModel addUserFeedViewModel) {
            var userFeed = readerDataService.AddUserFeed(User.Identity.Name, addUserFeedViewModel.FeedUrl);

            var feedViewModel = new UserFeedViewModel(userFeed);
            
            return feedViewModel;
        }

        [Route("api/UserFeed/{userFeedId}/refresh")]
        [HttpPost]
        public UserFeedViewModel RefreshUserFeed(int userFeedId) {
            var userFeed = readerDataService.RefreshUserFeed(User.Identity.Name, userFeedId);

            var feedViewModel = new UserFeedViewModel(userFeed);

            return feedViewModel;
        }

        [Route("api/UserFeed/{userFeedId}/items")]
        [HttpGet]
        public List<UserFeedItemViewModel> LoadUserFeedItems(int userFeedId, int skip) {
            var userFeedItems = readerDataService.LoadUserFeedItems(User.Identity.Name, userFeedId, skip);

            var feedItemsViewModel = userFeedItems.Select(ufi => new UserFeedItemViewModel(ufi)).ToList();

            return feedItemsViewModel;
        }

        [Route("api/UserFeed/{userFeedId}")]
        [HttpDelete]
        public int DeleteUserFeed(int userFeedId) {
            var deleteResult = readerDataService.DeleteUserFeed(User.Identity.Name, userFeedId);
            return deleteResult;
        }
        
        [Route("api/UserFeedItem")]
        [HttpPut]
        public UserFeedItemViewModel UpdateUserFeedItem([FromBody]UserFeedItemViewModel userFeedItemViewModel) {
            var userFeedItem = readerDataService.UpdateUserFeedItem(User.Identity.Name, userFeedItemViewModel);

            var feedItemViewModel = new UserFeedItemViewModel(userFeedItem);

            return feedItemViewModel;
        }
    }
}