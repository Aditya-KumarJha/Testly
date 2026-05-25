import Image from "next/image";
import { Button } from "../ui/button";
import { Link } from "lucide-react";

function EmptyWorkspace() {
  return (
    <div className="flex flex-col mt-10 items-center justify-center">
      <Image src={"/folder.png"} alt="Folder" width={70} height={70} />
      <h2 className="font-semibold text-2xl mt-5 mb-5">
        No Repository Connected
      </h2>
      <p className="text-center mx-10">
        Connect your Github accounts and add a repository to generate and run
        test cases.
      </p>
      <Button className="mt-5">
        <Link className="h-4 w-4 mr-2" /> Connect Repository
      </Button>
    </div>
  );
}

export default EmptyWorkspace;
