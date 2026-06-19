import SIMPLE_CreateStepTwo from "modules/date/create-date/SIMPLE_CreateStepTwo";

function DateEventPage(props) {
  return <SIMPLE_CreateStepTwo {...props} />;
}

export default DateEventPage;

export { createDateLimitServerSideProps as getServerSideProps } from "utils/createDateAccessGuard";
