using Reader.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Syndication;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using System.Data.Entity;
using Reader.Data;
using Reader.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Reader.Controllers {

    [Authorize]
    public class HomeController : Controller {

        ReaderData readerData = new ReaderData();

        public ActionResult Index() {
            var userFeeds = readerData.GetUserFeeds(User.Identity.Name);

            var readerViewModel = new {
                LoadTime = DateTimeOffset.Now,
                Feeds = userFeeds.Select(f => new {
                    UserFeedId = f.UserFeedId,
                    Title = f.Feed.Title,
                    ImageUrl = f.Feed.ImageUrl,
                    Items = f.Items.Select(i => new {
                        UserFeedItemId = i.UserFeedItemId,
                        FullUrl = i.FeedItem.GetFullUrl(),
                        Title = i.FeedItem.Title,
                        PublishDate = i.FeedItem.PublishDate,
                        IsRead = i.IsRead
                    })
                })
            };

            return View(readerViewModel);
        }

        [HttpPost]
        public JsonResult AddFeed(string feedUrl) {
            var result = new JsonResult();

            readerData.AddUserFeed(User.Identity.Name, feedUrl);

            return result;
        }

        public ActionResult About() {
            ViewBag.Message = "Reader Application";
            return View();
        }
    }
}