using Reader.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Syndication;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using System.Data.Entity;
using Reader.DataService;
using Reader.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Reader.Controllers {

    [Authorize]
    public class HomeController : Controller {

        ReaderDataService readerDataService = new ReaderDataService();

        public ActionResult Index() {
            var userFeeds = readerDataService.GetUserFeeds(User.Identity.Name);
            var loadTime = DateTimeOffset.Now;

            var readerViewModel = new ReaderViewModel(userFeeds, loadTime);

            return View(readerViewModel);
        }

        public ActionResult About() {
            ViewBag.Message = "Reader Application";
            return View();
        }
    }
}