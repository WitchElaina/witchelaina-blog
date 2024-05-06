"use client";

import { Button } from "@nextui-org/button";

export const SocialButton = (props: {
  link: string;
  icon: React.ReactNode;
}) => {
  return (
    <Button
      isIconOnly
      variant="light"
      size="lg"
      onClick={() => window.open(props.link, "_blank")}
    >
      {props.icon}
    </Button>
  );
};
