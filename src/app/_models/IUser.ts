export interface IUser {
  id: string;
  displayName: string;
  photoUrl: string;
  lastActive: number;
  description?: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
}
