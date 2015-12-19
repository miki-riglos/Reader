using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Reader.Startup))]
namespace Reader
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
