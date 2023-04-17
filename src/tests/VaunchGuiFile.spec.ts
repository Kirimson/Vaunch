import { test, describe, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

import { setActivePinia, createPinia } from "pinia";

import VaunchGuiFile from "@/components/VaunchGuiFile.vue";
import { VaunchLink } from "@/models/VaunchLink";

describe("given a Vaunch File component", () => {
  // Setup Pinia as this component depends on pinia stores
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const file = new VaunchLink("test_file.lnk", "https://example.com");
  test("filename is correct", () => {
    const wrapper = mount(VaunchGuiFile, {
      props: {
        file: file,
        parentFolderName: 'test'
      },
    });
    expect(wrapper.find(".filename").text()).toEqual(file.titleCase());
  });
});
