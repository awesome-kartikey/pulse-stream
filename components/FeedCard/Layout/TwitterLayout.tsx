import { useCurrentUser } from "@/hooks/user";
import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { BiHash, BiHomeCircle, BiMoney, BiUser } from "react-icons/bi";
import { BsBell, BsBookmark, BsEnvelope, BsTwitter } from "react-icons/bs";
import { SlOptions } from "react-icons/sl";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { graphqlClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link"; // Make sure Link is imported

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
  link: string;
}

interface TwitterlayoutProps {
  children: React.ReactNode;
}

const Twitterlayout: React.FC<TwitterlayoutProps> = (props) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const sidebarMenuItems: TwitterSidebarButton[] = useMemo(
    () => [
      {
        title: "Home",
        icon: <BiHomeCircle />,
        link: "/",
      },
      {
        title: "Explore",
        icon: <BiHash />,
        link: "/", // Consider linking to an actual explore page if you build one
      },
      {
        title: "Notifications",
        icon: <BsBell />,
        link: "/", // Consider linking to notifications page
      },
      {
        title: "Messages",
        icon: <BsEnvelope />,
        link: "/", // Consider linking to messages page
      },
      {
        title: "Bookmarks",
        icon: <BsBookmark />,
        link: "/", // Consider linking to bookmarks page
      },
      {
        title: "Twitter Blue", // Or "Premium"
        icon: <BiMoney />,
        link: "/", // Link to relevant page
      },
      {
        title: "Profile",
        icon: <BiUser />,
        // IMPORTANT: Handle potentially undefined user ID here
        link: user?.id ? `/${user.id}` : "#", // Link to '#' or '/' if no user ID yet
      },
      {
        title: "More Options",
        icon: <SlOptions />,
        link: "/",
      },
    ],
    [user?.id] // Dependency is correct
  );

  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) return toast.error(`Google token not found`);

      try {
        // Add try-catch for the API request
        const { verifyGoogleToken } = await graphqlClient.request(
          verifyUserGoogleTokenQuery,
          { token: googleToken }
        );

        toast.success("Verified Success");
        console.log("Received Token from backend:", verifyGoogleToken); // Log the received token

        if (verifyGoogleToken) {
          window.localStorage.setItem("__twitter_token", verifyGoogleToken);
        } else {
          // Handle case where backend might return null/undefined token unexpectedly
          console.error(
            "Verification successful but no token received from backend."
          );
          toast.error("Login succeeded but failed to retrieve session token.");
          // Optionally clear local storage if needed: window.localStorage.removeItem("__twitter_token");
        }

        // Always invalidate, even if token is missing, to refetch user state
        await queryClient.invalidateQueries({ queryKey: ["curent-user"] });
      } catch (error: any) {
        // Catch specific errors if possible
        console.error("Error verifying Google Token:", error);
        // Provide more specific error feedback
        const errorMessage =
          error?.response?.errors?.[0]?.message ||
          error.message ||
          "Verification failed";
        toast.error(`Login Error: ${errorMessage}`);
        // Ensure token isn't set if verification fails
        window.localStorage.removeItem("__twitter_token");
        // Still invalidate to potentially clear stale user data
        await queryClient.invalidateQueries({ queryKey: ["curent-user"] });
      }
    },
    [queryClient]
  );

  return (
    <div>
      <div className="grid grid-cols-12 h-screen w-screen sm:px-56">
        <div className="col-span-2 sm:col-span-3 pt-1 flex sm:justify-end pr-4 relative">
          <div>
            <div className="text-2xl h-fit w-fit hover:bg-gray-800 rounded-full p-4 cursor-pointer transition-all">
              <BsTwitter />
            </div>
            <div className="mt-1 text-xl pr-4">
              <ul>
                {sidebarMenuItems.map((item) => (
                  <li key={item.title}>
                    {/* Use conditional rendering or ensure link is valid */}
                    <Link
                      className={`flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full px-3 py-3 w-fit cursor-pointer mt-2 ${
                        item.link === "#"
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                      href={item.link} // Use the link generated in useMemo
                    >
                      <span className=" text-3xl">{item.icon}</span>
                      <span className="hidden sm:inline">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-5 px-3">
                <button className="hidden sm:block bg-[#1d9bf0] font-semibold text-lg py-2 px-4 rounded-full w-full hover:bg-[#1a8cd8] transition-colors">
                  Tweet
                </button>
                <button className="block sm:hidden bg-[#1d9bf0] font-semibold text-lg p-3 rounded-full hover:bg-[#1a8cd8] transition-colors">
                  {" "}
                  {/* Adjusted padding */}
                  <BsTwitter />
                </button>
              </div>
            </div>
          </div>
          {/* --- Conditional Rendering for Profile Section --- */}
          {user &&
            user.id && ( // Check for user and user.id before rendering
              <div className="absolute bottom-5 flex gap-2 items-center bg-slate-800 px-3 py-2 rounded-full">
                {user.profileImageURL && (
                  <Image
                    className="rounded-full"
                    src={user.profileImageURL}
                    alt="user-image"
                    height={50}
                    width={50}
                  />
                )}
                <div className="hidden sm:block">
                  <h3 className="text-xl">
                    {user.firstName} {user.lastName}
                  </h3>
                </div>
              </div>
            )}
        </div>
        <div className="col-span-10 sm:col-span-5 border-r-[1px] border-l-[1px] h-screen overflow-scroll border-gray-600">
          {props.children}
        </div>
        <div className="col-span-0 sm:col-span-3 p-5">
          {!user ? (
            <div className="p-5 bg-slate-700 rounded-lg">
              <h1 className="my-2 text-2xl">New to Twitter?</h1>
              <GoogleLogin
                onSuccess={handleLoginWithGoogle}
                onError={() => {
                  console.error("Google Login Failed");
                  toast.error("Google Login Failed. Please try again.");
                }}
              />
            </div>
          ) : (
            <div className="px-4 py-3 bg-slate-800 rounded-lg">
              <h1 className="my-2 text-2xl mb-5">Users you may know</h1>
              {user?.recommendedUsers && user.recommendedUsers.length > 0 ? ( // Check if array exists and has items
                user.recommendedUsers.map((el) =>
                  // Add checks for el and el.id before rendering link/content
                  el?.id ? (
                    <div className="flex items-center gap-3 mt-2" key={el.id}>
                      {el.profileImageURL && (
                        <Image
                          src={el.profileImageURL}
                          alt="user-image"
                          className="rounded-full"
                          width={60}
                          height={60}
                        />
                      )}
                      <div>
                        <div className="text-lg">
                          {el.firstName} {el.lastName}
                        </div>
                        {/* --- FIX: Conditional Link --- */}
                        <Link
                          href={`/${el.id}`} // el.id is guaranteed here by the outer check
                          className="bg-white text-black text-sm px-5 py-1 w-full rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ) : null // Don't render if el or el.id is missing
                )
              ) : (
                <p className="text-sm text-gray-400">
                  No recommendations right now.
                </p> // Handle empty recommendations
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Twitterlayout;
