import moment from 'moment';

const RenderRemainTime = ({offer}) => {
  const durationValue = moment.duration(moment(offer.expiredDate).diff(moment()));
  let unitTime = 'ngày';

  let duration = durationValue.asDays();

  if (duration < 1) {
    duration = durationValue.hours();
    unitTime = 'giờ';
  }

  if (duration < 1) {
    duration = durationValue.minutes();
    unitTime = 'phút';
  }

  return (
    offer?.comingSoon ?
      <span className="bg-white text-red-400 rounded-full px-5 py-2 border border-red-400">
        Coming soon
      </span> :
      <>
        {
          duration <= 30 ?
            <span className="bg-btn-10 text-white rounded-full px-5 py-2">
              Còn {Math.floor(duration)} {unitTime}
            </span> :
            <span className="px-5 py-2">
                &nbsp;&nbsp;
            </span>
        }
      </>
  );
};

export default RenderRemainTime;