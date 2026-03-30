import RentalPlacesPage from "../place/pages/RentalPlacesPage";
import PlaceDetailPage from "../place/pages/PlaceDetailPage";

export const placeRouter = () => {
  return [
    {
      path: "rental",
      Component: RentalPlacesPage,
    },
    {
      path: ":id",
      Component: PlaceDetailPage,
    },
  ];
};
