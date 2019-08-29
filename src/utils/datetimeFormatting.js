Date.monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatTxDateObj = (dateObj) => {
    const month = Date.monthAbbr[dateObj.getMonth()];
    const date = `0${dateObj.getDate()}`.slice(-2);
    const time = [dateObj.getHours(), dateObj.getMinutes()]
      .map(output => `0${output}`.slice(-2))
      .join(':');
    return `${month} ${date}, ${time}`;
}
