import { VaunchFile } from "./VaunchFile";
import type { VaunchFolder } from "./VaunchFolder";

export abstract class VaunchUrlFile extends VaunchFile {
  parent: VaunchFolder | undefined;
  filetype = "VaunchUrlFile";

  constructor(
    name: string,
    parent: VaunchFolder | undefined,
    icon: string,
    iconClass: string,
    hits = 0,
    description = ""
  ) {
    super(name, icon, iconClass, hits);
    this.description = description;
    if (parent) {
      this.parent = parent;
      this.aliases.push(`${this.parent.name}/${this.fileName}`);
    }
  }

  protected prependHttps(urlString: string): string {
    const httpsTest = /^https?:\/\//g;
    if (!httpsTest.test(urlString)) urlString = "https://" + urlString;
    return urlString;
  }

  protected createUrl(url: string = this.content): URL | undefined {
    try {
      // If passed url starts with http/https already, attempt to return it as a URL
      // otherwise prepend https:// to it.
      const httpPrefixedTest = /^https?:\/\//g;
      if (httpPrefixedTest.test(url)) {
        return new URL(url);
      } else url = this.prependHttps(url);

      // Now with https:// prepended, run an additional URL test against the string
      const fullUrlTest =
        /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=()']*)$/g;
      if (fullUrlTest.test(url)) {
        return new URL(url);
      } else return undefined;
    } catch (e) {
      return undefined;
    }
  }

  getCorrectURL(): string {
    // Returns a url representation of this file's content
    const linkUrl: URL | undefined = this.createUrl();
    if (linkUrl) {
      return linkUrl.href;
    } else {
      return this.content;
    }
  }

  hasValidURL(): boolean {
    // Checks if this file's content is a valid URL
    const linkUrl: URL | undefined = this.createUrl();
    if (linkUrl) return true;
    return false;
  }
}
