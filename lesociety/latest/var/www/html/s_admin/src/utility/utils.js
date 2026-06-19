export const passwordValidator = (password) => {
	// var pattern = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d].{7,}$/);
	// /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
	var pattern = new RegExp(
		/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}/
	);
	//
	// 		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&{}(_)#+:;<>/=",.])[A-Za-z\d@$!%*?&(_){}#+:;<>/=",.]{8,}$/

	var response = "";
	if (!pattern.test(password)) {
		// response =
		// 	"Please enter minimum eight characters, at least one capital letter, one small letter, one number, one special character.";
	}
	return response;
};

export const emailValidator = (email) => {
	var pattern = new RegExp(
		/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
	);
	var response = "";
	if (!pattern.test(email)) {
		response = "Please enter correct Email address.";
	}
	return response;
};

export const phoneNoValidator = (phoneNumber, countryPin) => {
	// var pattern = new RegExp(/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/);
	// var pattern = new RegExp(/^[7-9]\d{9}$/);
	let limit = 9;

	if (Number(countryPin) === 1) {
		limit = 10;
	}
	let pattern = new RegExp(/^0?\d{9}$/);
	if (limit === 10) pattern = new RegExp(/^0?\d{10}$/);

	var response = "";
	if (!pattern.test(phoneNumber)) {
		response = `Phone number must be valid and ${limit} digits long.`;
	}
	return response;
};
