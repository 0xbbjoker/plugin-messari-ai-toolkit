import { describe, expect, it } from "bun:test";
import messariPlugin from "../index";
import { copilotProvider } from "../providers/copilot";

describe("Messari Plugin", () => {
  it("should export the plugin with correct structure", () => {
    expect(messariPlugin).toBeDefined();
    expect(messariPlugin.name).toBe("messariAiToolkit");
    expect(messariPlugin.description).toBe(
      "Messari AI Toolkit for crypto market research capabilities",
    );
  });

  it("should have empty actions array", () => {
    expect(messariPlugin.actions).toBeDefined();
    expect(Array.isArray(messariPlugin.actions)).toBe(true);
    expect(messariPlugin.actions!.length).toBe(0);
  });

  it("should include copilot provider", () => {
    expect(messariPlugin.providers).toBeDefined();
    expect(Array.isArray(messariPlugin.providers)).toBe(true);
    expect(messariPlugin.providers!.length).toBe(1);
    expect(messariPlugin.providers![0]).toBe(copilotProvider);
    expect(messariPlugin.providers![0].name).toBe("messariCopilot");
  });

  it("should have empty evaluators array", () => {
    expect(messariPlugin.evaluators).toBeDefined();
    expect(Array.isArray(messariPlugin.evaluators)).toBe(true);
    expect(messariPlugin.evaluators!.length).toBe(0);
  });

  it("should have empty services array", () => {
    expect(messariPlugin.services).toBeDefined();
    expect(Array.isArray(messariPlugin.services)).toBe(true);
    expect(messariPlugin.services!.length).toBe(0);
  });

  it("should export providers namespace", async () => {
    const { providers } = await import("../index");
    expect(providers).toBeDefined();
    expect(providers.copilotProvider).toBe(copilotProvider);
  });

  it("should have all required plugin properties", () => {
    const requiredProperties = [
      "name",
      "description",
      "actions",
      "providers",
      "evaluators",
      "services",
    ];
    requiredProperties.forEach((prop) => {
      expect(messariPlugin).toHaveProperty(prop);
    });
  });

  it("should export default plugin", async () => {
    const module = await import("../index");
    expect(module.default).toBe(messariPlugin);
    expect(module.messariPlugin).toBe(messariPlugin);
  });
});
