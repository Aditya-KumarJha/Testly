import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

function WorkSpaceHeader() {
  return (
    <div className="flex w-full justify-between p-4">
      {/* Logo */}
      <Image src="/logo.svg" alt="Logo" width={50} height={50} />

      {/* Menu Options */}
      <ul className="flex gap-15 text-xl">
        <li className="hover:text-[#6D9846] cursor-pointer">Workspace</li>
        <li className="hover:text-[#6D9846] cursor-pointer">Pricing</li>
        <li className="hover:text-[#6D9846] cursor-pointer">Support</li>
      </ul>

      <UserButton />
    </div>
  );
}

export default WorkSpaceHeader;
