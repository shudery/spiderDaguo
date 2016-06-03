function getTime() {
	var nowTime = new Date(),
		nowMill = nowTime.getTime().toString().slice(-3),
		nowdate = nowTime.toString().match(/(.{8})\sGMT/)[1];
	return '<' + (nowdate + '-' + nowMill).grey + '>';
};

function createId() {
	return String(Math.floor(100000000 * Math.random())).slice(0, 6);
};
module.exports = {
	getTime:getTime,
	createId:createId
}