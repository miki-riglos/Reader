using Reader.DataService;
using Reader.ViewModels;
using System.Web.Mvc;

namespace Reader.Controllers {

    [Authorize]
    public class HomeController : Controller {

        ReaderDataService readerDataService = new ReaderDataService();

        public ActionResult Index() {
            var subscriptions = readerDataService.GetSubscriptions(User.Identity.Name);

            var readerViewModel = new ReaderViewModel(subscriptions);

            return View(readerViewModel);
        }

        public ActionResult About() {
            ViewBag.Message = "Reader Application";
            return View();
        }
    }
}