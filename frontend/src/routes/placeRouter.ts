import RentalPlacesPage from "../place/pages/RentalPlacesPage";
import PlaceDetailPage from "../place/pages/PlaceDetailPage";
import MyReservationsPage from "../place/pages/MyReservationsPage";
import MyPlaceReviewPage from "../place/pages/MyPlaceReviewPage";
import MyUsedPlacesPage from "../place/pages/MyUsedPlacesPage";
import MyLikedPlacesPage from "../place/pages/MyLikedPlacesPage";

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
      path: "my",
      Component: MyUsedPlacesPage,
    },
    {
      path: "liked",
      Component: MyLikedPlacesPage,
    },
    {
      path: ":id",
      Component: PlaceDetailPage,
    },
  ];
};
