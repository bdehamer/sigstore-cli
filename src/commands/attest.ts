import { Args, Command, Flags } from "@oclif/core";
import * as fs from "fs";
import { sigstore } from "sigstore";

export default class Attest extends Command {
  static description = "attest the supplied file";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static enableJsonFlag = true;
  static flags = {
    "fulcio-url": Flags.string({
      description: "URL to the Sigstore PKI server",
      default: "https://fulcio.sigstore.dev",
    }),
    "rekor-url": Flags.string({
      description: "URL to the Rekor transparency log",
      default: "https://rekor.sigstore.dev",
    }),
    "tsa-url": Flags.string({
      description: "URL to the Timestamping Authority",
      required: false,
    }),
    "tlog-upload": Flags.boolean({
      description: "whether or not to upload entry to the transparency log",
      default: true,
    }),
    "oidc-client-id": Flags.string({
      description: "OIDC client ID for application",
      default: "sigstore",
    }),
    "oidc-issuer": Flags.string({
      description: "OIDC provider to be used to issue ID token",
      default: "https://oauth2.sigstore.dev/auth",
    }),
    "oidc-redirect-url": Flags.string({
      description: "OIDC redirect URL",
      required: false,
      env: "OIDC_REDIRECT_URL",
    }),
    type: Flags.string({
      char: "t",
      description: "type to apply to the DSSE envelope",
      default: "application/vnd.in-toto+json",
    }),
    "output-file": Flags.string({
      char: "o",
      description: "write output to file",
      required: false,
      aliases: ["output", "out"],
    }),
  };

  static args = {
    file: Args.file({
      description: "file to attest",
      required: true,
      exists: true,
    }),
  };

  public async run(): Promise<sigstore.Bundle> {
    const { args, flags } = await this.parse(Attest);

    const payload = fs.readFileSync(args.file);
    const options = {
      oidcClientID: flags["oidc-client-id"],
      oidcIssuer: flags["oidc-issuer"],
      oidcRedirectURL: flags["oidc-redirect-url"],
      rekorURL: flags["rekor-url"],
      fulcioURL: flags["fulcio-url"],
      tsaURL: flags["tsa-url"],
    };

    const bundle = await sigstore.attest(payload, flags.type, options);

    if (flags["output-file"]) {
      fs.writeFileSync(flags["output-file"], JSON.stringify(bundle));
    } else {
      this.log(JSON.stringify(bundle));
    }

    return bundle;
  }
}
