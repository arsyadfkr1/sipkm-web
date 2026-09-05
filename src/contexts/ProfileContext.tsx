"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ProfileData = {
  name: string;
  email: string;
  phone: string;
  region: string;
  address: string;
};

type ProfileContextType = {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
};

const defaultProfileData: ProfileData = {
  name: "Arsyad",
  email: "Arsyadrahman@Gmail.com",
  phone: "+62 812-3456-7890",
  region: "Kemiling, Bandar Lampung",
  address: "Jl. Teuku Cik Ditiro No. 45, Perumahan Beringin Jaya, Kemiling.",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);

  return <ProfileContext.Provider value={{ profileData, setProfileData }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
