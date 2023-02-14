import { By, VSBrowser, EditorView, WebView, Workbench, Notification, StatusBar, NotificationType } from "vscode-extension-tester";
import { expect } from "chai";
import { sleep } from "./utils";
import { join } from "path";

// https://github.com/microsoft/vscode-java-dependency/blob/4256fa6adcaff5ec24dbdbb8d9a516fad21431c5/test/ui/index.ts
// https://github.com/microsoft/vscode-java-dependency/blob/4256fa6adcaff5ec24dbdbb8d9a516fad21431c5/test/ui/command.test.ts

describe("Initialization testing", function() {
  this.timeout(2 * 60 * 1000 /*ms*/);

  let workbench: Workbench;
  let view: WebView;

  before(async function() {
    await VSBrowser.instance.openResources(join(__dirname, '../sample'));
    await sleep(3000);
    workbench = new Workbench();

    await workbench.executeCommand("frontMatter.dashboard");
    await sleep(3000);

    await new EditorView().openEditor(`FrontMatter Dashboard`);

    view = new WebView();
    await view.switchToFrame();
  });

  it("1. Open welcome dashboard", async function() {
    const element = await view.findWebElement(By.css('h1'));

    const title = await element.getText();

    expect(title).has.string(`Front Matter`);
  });

  it("2. Initialize project", async function() {
    const btn = await view.findWebElement(By.css('[data-test="welcome-init"] button'));
    expect(btn).to.exist;

    await btn.click();

    await sleep(1000);

    await VSBrowser.instance.driver.wait(() => {
      return notificationExists(workbench, 'Front Matter:');
    }, 2000) as Notification;

    const notifications = await workbench.getNotifications();

    let notification!: Notification;
    for (const not of notifications) {
      console.log(not);

      // const message = await not.get;
      // console.log(message);
      // if (message.includes('Front Matter:')) {
      //   notification = not;
      // }
    }

    expect(await notification.getMessage()).has.string(`Project initialized successfully.`);
  });

  it("3. Check if project file is created", async function() {});
});


async function notificationExists(workbench: Workbench, text: string): Promise<Notification | undefined> {
  const notifications = await (await (new StatusBar()).openNotificationsCenter()).getNotifications(NotificationType.Info);

  for (const notification of notifications) {
    const message = await notification.getMessage();
    if (message.indexOf(text) >= 0) {
      return notification;
    }
  }
}
