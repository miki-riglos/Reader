using Reader.DataService;
using Reader.ViewModels;
using System.Web.Mvc;

namespace Reader.Controllers {

    [Authorize]
    public class HomeController : Controller {

        ReaderDataService readerDataService = new ReaderDataService();

        public ActionResult Index() {
            var userFeeds = readerDataService.GetUserFeeds(User.Identity.Name);

            var readerViewModel = new ReaderViewModel(userFeeds);

            return View(readerViewModel);
        }

        public ActionResult About() {
            ViewBag.Message = "Reader Application";
            return View();
        }
    }
}