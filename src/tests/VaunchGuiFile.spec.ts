import { test, describe, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

import { setActivePinia, createPinia } from "pinia";

import VaunchGuiFile from "@/components/VaunchGuiFile.vue";
import { VaunchLink } from "@/models/VaunchLink";
import { VaunchFolder } from "@/models/VaunchFolder";

describe("given a Vaunch File component", () => {
  // Setup Pinia as this component depends on pinia stores
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const folder = new VaunchFolder("test");
  const file = new VaunchLink("test_file.lnk", "https://example.com", folder);
  test("filename is correct", () => {
    const wrapper = mount(VaunchGuiFile, {
      props: {
        file: file,
      },
    });
    expect(wrapper.find(".filename").text()).toEqual(file.titleCase());
  });
});
