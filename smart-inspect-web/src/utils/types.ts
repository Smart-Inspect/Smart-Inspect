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
  createdAt: Date;
  updatedAt: Date;
}
