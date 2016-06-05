function getTime() {
	var nowTime = new Date(),
		nowMill = nowTime.getTime().toString().slice(-3),
		nowdate = nowTime.toString().match(/(.{8})\sGMT/)[1];
	return '<' + (nowdate + '-' + nowMill).grey + '>';
};

function createId() {
	var sixteenId = '';
	for(var i=0;i<10;i++){
		sixteenId += Math.floor(Math.random()*16).toString(16);
	}
	return sixteenId;
};
module.exports = {
	getTime:getTime,
	createId:createId
}