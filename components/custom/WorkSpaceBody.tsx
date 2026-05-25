"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/context/UserDetailContext";
import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import EmptyWorkspace from "./EmptyWorkspace";
import axios from "axios";
import RepoDialog, { Repo } from "./RepoDialog";
import UserRepoList from "./UserRepoList";

function WorkSpaceBody() {
  const { userDetail } = useContext(UserDetailContext);
  const router = useRouter();
  const [token, setToken] = useState("");
  const [userRepoList, setUserRepoList] = useState<Repo[]>([]);

  useEffect(() => {
    getGithubUserToken();
  }, []);

  useEffect(() => {
    userDetail && getUserRepoList();
  }, [userDetail]);

  const getGithubUserToken = async () => {
    const result = await axios.get("/api/github/token");
    setToken(result.data.token);
  };

  const onAddRepo = async () => {
    router.push("/api/github");
  };

  const getUserRepoList = async () => {
    const result = await axios.get("/api/user-repo?userId=" + userDetail?.id);

    setUserRepoList(result.data);
    return result.data;
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-semibold">Workspace</h2>
        <h2 className="text-2xl font-semibold text-[#6D9846] bg-green-200 px-2 rounded-lg">
          Remaining Credits: {userDetail?.credits}
        </h2>
      </div>

      <Card className="mt-5 flex justify-between items-center p-4 border rounded-lg">
        <div className="flex items-center gap-5">
          <Image src={"/github.png"} alt="GitHub" width={40} height={40} />
          <h2 className="text-lg font-semibold">
            Connect Github & Add Repository
          </h2>
        </div>
        <div>
          {!token ? (
            <Button onClick={onAddRepo}>+ Add Github</Button>
          ) : (
            <RepoDialog
              setRefreshPage={(refresh: boolean) => getUserRepoList()}
            />
          )}
        </div>
      </Card>
      {!userRepoList ? (
        <Card className="mt-10">
          <CardContent>
            <EmptyWorkspace />
          </CardContent>
        </Card>
      ) : (
        <UserRepoList repoList={userRepoList} />
      )}
    </div>
  );
}

export default WorkSpaceBody;
