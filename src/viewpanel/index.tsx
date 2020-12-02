import * as React from "react";
import { render } from "react-dom";
import { ViewPanel } from "./ViewPanel";

const elm = document.querySelector("#app");
render(<ViewPanel />, elm);