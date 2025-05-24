export interface PropertyLocation {
  streetAddress: string;
}

export interface PropertyDetails {
  squareFeet: number;
  leaseType: string;
  beds: number;
  baths: number;
}

export interface ExpectedRent {
  expectedRent: number;
  negotiable: boolean;
}

export interface Apartment {
  id?: string;
  apartmentBuilding: string;
  apartmentBuildingName?: string;
  isShared: boolean;
  propertyLocation: PropertyLocation;
  propertyDetails: PropertyDetails;
  expectedRent: ExpectedRent;
  utilitiesIncluded: boolean;
  isFurnished: boolean;
  amenities: string[];
  description: string;
  title: string;
  createdAt?: Date;
  images: string[];
  isFavorite?: boolean;
  contactName: string;
  contactEmail: string;
}