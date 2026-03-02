import { Outlet } from "react-router-dom";
import MainHeader from "../ui/components/MainHeader";
import { LoaderFunctionArguments } from "./types/LoaderFunctionArguments";

const RootLayout: React.FC = () => {
  return (
    <>
      <MainHeader isRunMode={false} />
      <Outlet />
    </>
  );
};

export default RootLayout;

export async function loader({request}:LoaderFunctionArguments) {
  const url = new URL(request.url);
  const pathNameArray = url.pathname.split('/');
  return pathNameArray.length > 0 ? pathNameArray[1] : '';
}