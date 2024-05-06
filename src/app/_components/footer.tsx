import Container from "@/app/_components/container";
import { Button, ButtonGroup } from "@nextui-org/button";
import { EXAMPLE_PATH, GITHUB_URL, X_URL } from "@/lib/constants";
import { NextUIProvider } from "@nextui-org/react";
import { GithubIcon } from "../_icons/Github";
import { XIcon } from "../_icons/X";
import { SocialButton } from "./social-button";

export function Footer() {
  return (
    <NextUIProvider>
      <footer className="bg-neutral-50 border-t border-neutral-200">
        <Container>
          <div className="py-28 flex flex-col lg:flex-row items-center">
            <h3 className="text-4xl lg:text-[2.5rem] font-bold tracking-tighter leading-tight text-center lg:text-left mb-10 lg:mb-0 lg:pr-4 lg:w-1/2">
              WitchElaina
              <span className=" text-base pl-4">
                © 2002-{new Date().getFullYear()}
              </span>
              <div className=" text-lg font-normal tracking-tight">
                Statically Generated with Next.js.
              </div>
            </h3>

            <div className="flex flex-col lg:flex-row justify-end items-center lg:pl-4 lg:w-1/2">
              <SocialButton link={X_URL} icon={<XIcon size={30} />} />
              <SocialButton link={GITHUB_URL} icon={<GithubIcon size={30} />} />
            </div>
          </div>
        </Container>
      </footer>
    </NextUIProvider>
  );
}

export default Footer;
