using Reader.DataService;
using Reader.ViewModels;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace Reader.Controllers {

    [Authorize]
    public class HomeController : Controller {

        ReaderDataService readerDataService = new ReaderDataService();

        public async Task<ActionResult> Index() {
            var subscriptions = await readerDataService.GetSubscriptionsAsync(User.Identity.Name);

            var readerViewModel = new ReaderViewModel(subscriptions);

            return View(readerViewModel);
        }

        public ActionResult About() {
            ViewBag.Message = "Reader Application";
            return View();
        }
    }
}