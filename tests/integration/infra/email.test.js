import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Support <contato@maruyama-work.com.br>",
      to: "contato@curso.dev",
      subject: "Test email",
      text: "This is a test email",
    });
    await email.send({
      from: "Support <contato@maruyama-work.com.br>",
      to: "contato@curso.dev",
      subject: "Last email",
      text: "This is a test email, this is the last email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@maruyama-work.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Last email");
    expect(lastEmail.text).toBe(
      "This is a test email, this is the last email\n",
    );
  });
});
