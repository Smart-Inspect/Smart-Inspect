export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissionLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInspection {
  id: string;
  engineer: IUser;
  unit: IUnit;
  project: IProject;
  inspectionDate: Date;
  layout: string;
  notes: string;
  images: string[];
  status: "completed" | "not-started";
}

export interface IUnit {
  id: string;
  number: string;
  building: IBuilding;
  inspections: IInspection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  building: IBuilding;
  units: IUnit[];
  engineers: IUser[];
  inspections: IInspection[];
  status: "started" | "completed" | "not-started";
  createdAt: Date;
  updatedAt: Date;
}

interface IAddress {
  address: string;
  changedAt: Date;
}

export interface IBuilding {
  id: string;
  name: string;
  address: string;
  addresses: IAddress[];
  units: IUnit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IImage {
  id: string;
  name: string;
  url: string; // The URL of the uploaded image in the cloud storage
  type: string;
  uploader: IUser;
  timestamp: Date;
  uploadedAt: Date;
}
