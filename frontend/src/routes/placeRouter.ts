import RentalPlacesPage from "../place/pages/RentalPlacesPage";
import PlaceDetailPage from "../place/pages/PlaceDetailPage";
import MyReservationsPage from "../place/pages/MyReservationsPage";

export const placeRouter = () => {
  return [
    {
      path: "rental",
      Component: RentalPlacesPage,
    },
    {
      path: "my-reservations",
      Component: MyReservationsPage,
    },
    {
      path: ":id",
      Component: PlaceDetailPage,
    },
  ];
};
