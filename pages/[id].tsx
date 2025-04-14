import { useRouter } from "next/router";
import Twitterlayout from "@/components/FeedCard/Layout/TwitterLayout";
import Image from "next/image";
import type { GetServerSideProps, NextPage } from "next";
import { BsArrowLeftShort } from "react-icons/bs";
import { useCurrentUser } from "@/hooks/user";
import FeedCard from "@/components/FeedCard";
import { Tweet, User } from "@/gql/graphql";
import { graphqlClient } from "@/clients/api";
import { getUserByIdQuery } from "@/graphql/query/user";
import { useCallback, useMemo } from "react";
import {
  followUserMutation,
  unfollowUserMutation,
} from "@/graphql/mutation/user";
import { useQueryClient } from "@tanstack/react-query";

interface ServerProps {
  userInfo?: User;
  error?: string;
}

const UserProfilePage: NextPage<ServerProps> = (props) => {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  // --- MOVED HOOKS HERE ---
  const amIFollowing = useMemo(() => {
    // This check is safe even if props.userInfo is undefined initially
    if (!props.userInfo) return false;
    return (
      (currentUser?.following?.findIndex(
        (el) => el?.id === props.userInfo?.id
      ) ?? -1) >= 0
    );
    // Dependency array is correct as props.userInfo might change if page data revalidates
  }, [currentUser?.following, props.userInfo]);

  const handleFollowUser = useCallback(async () => {
    // This check handles the case where props.userInfo might be undefined
    if (!props.userInfo?.id) return;

    await graphqlClient.request(followUserMutation, { to: props.userInfo?.id });
    await queryClient.invalidateQueries({ queryKey: ["curent-user"] });
    await queryClient.invalidateQueries({
      queryKey: ["user-by-id", props.userInfo?.id],
    });
    // Dependency array is correct
  }, [props.userInfo?.id, queryClient]);

  const handleUnfollowUser = useCallback(async () => {
    // This check handles the case where props.userInfo might be undefined
    if (!props.userInfo?.id) return;

    await graphqlClient.request(unfollowUserMutation, {
      to: props.userInfo?.id,
    });
    await queryClient.invalidateQueries({ queryKey: ["curent-user"] });
    await queryClient.invalidateQueries({
      queryKey: ["user-by-id", props.userInfo?.id],
    });
    // Dependency array is correct
  }, [props.userInfo?.id, queryClient]);
  // --- END MOVED HOOKS ---

  // Now the early returns are safe
  if (props.error) {
    return (
      <Twitterlayout>
        <div className="p-5 text-red-500 text-center">
          Error loading user: {props.error}
        </div>
      </Twitterlayout>
    );
  }

  if (!props.userInfo) {
    return (
      <Twitterlayout>
        <div className="p-5 text-center">User not found.</div>
      </Twitterlayout>
    );
  }

  // --- Component JSX ---
  return (
    <div>
      <Twitterlayout>
        <div>
          <nav className="flex items-center gap-3 py-3 px-3 border-b border-slate-800">
            <button
              onClick={() => router.back()}
              className="text-4xl hover:bg-gray-800 rounded-full p-1"
            >
              <BsArrowLeftShort />
            </button>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                {props.userInfo?.firstName} {props.userInfo?.lastName}
              </h1>
              <h2 className="text-xs font-medium text-slate-500">
                {props.userInfo?.tweets?.length ?? 0} Tweets
              </h2>
            </div>
          </nav>
          <div className="p-4 border-b border-slate-800">
            {props.userInfo?.profileImageURL && (
              <Image
                src={props.userInfo?.profileImageURL}
                alt="user-image"
                className="rounded-full mb-4"
                width={100}
                height={100}
              />
            )}
            <h1 className="text-xl font-bold mt-2">
              {props.userInfo?.firstName} {props.userInfo?.lastName}
            </h1>
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-4 text-sm text-gray-400">
                <span>
                  <span className="font-bold text-white">
                    {props.userInfo?.followers?.length ?? 0}
                  </span>{" "}
                  followers
                </span>
                <span>
                  <span className="font-bold text-white">
                    {props.userInfo?.following?.length ?? 0}
                  </span>{" "}
                  following
                </span>
              </div>
              {currentUser?.id !== props.userInfo?.id && (
                <>
                  {amIFollowing ? (
                    <button
                      onClick={handleUnfollowUser}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm font-semibold transition-colors"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={handleFollowUser}
                      className="bg-white hover:bg-gray-200 text-black px-3 py-1 rounded-full text-sm font-semibold transition-colors"
                    >
                      Follow
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            {props.userInfo?.tweets?.length === 0 ? (
              <div className="p-5 text-center text-gray-500">
                This user has&apos;t tweeted yet.
              </div>
            ) : (
              props.userInfo?.tweets?.map((tweet) =>
                tweet ? <FeedCard data={tweet as Tweet} key={tweet.id} /> : null
              )
            )}
          </div>
        </div>
      </Twitterlayout>
    </div>
  );
};

// getServerSideProps remains the same as the previous fix
export const getServerSideProps: GetServerSideProps<ServerProps> = async (
  context
) => {
  const id = context.query.id as string | undefined;

  if (
    !id ||
    typeof id !== "string" ||
    id.trim() === "" ||
    id.toLowerCase() === "undefined"
  ) {
    console.warn(
      `getServerSideProps ([id].tsx): Invalid or missing ID received: "${id}"`
    );
    return { notFound: true };
  }

  try {
    const queryKey = ["user-by-id", id];
    const userInfo = await graphqlClient.request(getUserByIdQuery, { id });

    if (!userInfo?.getUserById) {
      console.warn(
        `getServerSideProps ([id].tsx): User not found in DB for ID: ${id}`
      );
      return { notFound: true };
    }

    return {
      props: {
        userInfo: userInfo.getUserById as User,
      },
    };
  } catch (error: any) {
    console.error(
      `getServerSideProps ([id].tsx): Error fetching user for ID ${id}:`,
      error.message || error
    );
    if (error.response?.status === 404) {
      return { notFound: true };
    }
    return {
      // props: { error: `Failed to load user data. (${error.response?.status || 'Network Error'})` },
      notFound: true,
    };
  }
};

export default UserProfilePage;
