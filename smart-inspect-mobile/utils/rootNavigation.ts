import * as React from "react";
import { NavigationContainerRef } from "@react-navigation/native";

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function navigate(options: never) {
  navigationRef.current?.navigate(options);
}

export interface RootStackParamList {
  "(tabs)": undefined;
  index: undefined;
  login: undefined;
  signup: undefined;
  forgotpassword: undefined;
  "+not-found": undefined;
}
