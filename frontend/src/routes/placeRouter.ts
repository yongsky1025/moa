import RentalPlacesPage from "../place/pages/RentalPlacesPage";
import PlaceDetailPage from "../place/pages/PlaceDetailPage";
import MyReservationsPage from "../place/pages/MyReservationsPage";
import MyPlaceReviewPage from "../place/pages/MyPlaceReviewPage";

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
      path: "my-reviews",
      Component: MyPlaceReviewPage,
    },
    {
      path: ":id",
      Component: PlaceDetailPage,
    },
  ];
};
