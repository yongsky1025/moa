import RentalPlacesPage from "../place/pages/RentalPlacesPage";

export const placeRouter = () => {
  return [
    {
      path: "rental",
      Component: RentalPlacesPage,
    },
  ];
};
