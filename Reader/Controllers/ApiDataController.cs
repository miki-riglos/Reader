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

        [Route("api/AddFeed")]
        [HttpPost]
        public UserFeedViewModel AddFeed([FromBody]AddUserFeedViewModel addUserFeedViewModel) {
            var userFeed = readerDataService.AddUserFeed(User.Identity.Name, addUserFeedViewModel.FeedUrl);
            var loadTime = DateTimeOffset.Now;

            var feedViewModel = new UserFeedViewModel(userFeed, loadTime);
            
            return feedViewModel;
        }
    }
}