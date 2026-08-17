'use client';

import UserForm from "@/components/layout/UserForm";
import UserTabs from "@/components/layout/UserTabs";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const {
    data: session,
    status,
    update,
  } = useSession();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  /*
   * Fetch the user's profile from MongoDB
   */
  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load profile.");
        }

        const data = await response.json();

        setUser(data);
        setIsAdmin(data.admin === true);
      } catch (error) {
        console.error(
          "Failed to fetch profile:",
          error
        );

        toast.error("Unable to load profile.");
      } finally {
        setProfileFetched(true);
      }
    }

    fetchProfile();
  }, [status]);

  /*
   * Save profile information
   */
  async function handleProfileInfoUpdate(ev, data) {
    ev.preventDefault();

    const savingPromise = (async () => {
      const response = await fetch("/api/profile", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Unable to save profile.";

        try {
          const result = await response.json();

          if (result?.error) {
            errorMessage = result.error;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      /*
       * IMPORTANT:
       *
       * MongoDB has now been updated.
       *
       * Tell NextAuth to update the current session
       * with the new name.
       */
      if (data.name !== undefined) {
        await update({
          name: data.name,
        });
      }

      /*
       * Update the local profile state as well.
       */
      setUser((previousUser) => ({
        ...previousUser,
        ...data,
      }));
    })();

    await toast.promise(savingPromise, {
      loading: "Saving...",
      success: "Profile saved!",
      error: (error) =>
        error?.message || "Error saving profile.",
    });
  }

  /*
   * Loading
   */
  if (
    status === "loading" ||
    !profileFetched
  ) {
    return "Loading...";
  }

  /*
   * Not logged in
   */
  if (status === "unauthenticated") {
    return redirect("/login");
  }

  return (
    <section className="mt-8">
      <UserTabs isAdmin={isAdmin} />

      <div className="max-w-2xl mx-auto mt-8">
        <UserForm
          user={user}
          onSave={handleProfileInfoUpdate}
        />
      </div>
    </section>
  );
}