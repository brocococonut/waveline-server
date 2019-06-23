import { IContext, HttpStatus, app } from "@wellenline/via";
import { IncomingForm } from "formidable";

/**
 * Basic cors module
 * @param context request
 */
export const cors = async (context: IContext) => {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "OPTIONS, DELETE, PUT, PATCH, POST, GET",
		"Access-Control-Max-Age": 2592000,
	};

	if (context.req.method === "OPTIONS") {
		context.res.writeHead(204, headers);
		context.res.end();
		return false;
	}

	return true;

};

/**
 * Simple body parser
 * @param context request
 */
export const bodyParser = async (context: IContext) => {
	return await new Promise((resolve, reject) => {
		const form = new IncomingForm();
		form.maxFields = 500;
		form.maxFieldsSize = 2 * 1024 * 1024;
		form.parse(context.req, (err, fields, files) => {
			context.req.files = files;
			context.req.body = fields;

			resolve(true);
		});
	});

};

export const auth = (whitelist: string[]) => {
	return (context: IContext) => {
		if (process.env.AUTH_ENABLED === "true") {
			if (whitelist.some((v) => context.req.parsed.path.indexOf(v) > -1)) {
				return true;
			}

			const api_key = context.req.headers["x-api-key"] || context.req.query.key;
			if (!api_key) {

				context.res.writeHead(HttpStatus.UNAUTHORIZED, app.headers);
				context.res.write(JSON.stringify({
					statusCode: HttpStatus.UNAUTHORIZED,
					message: "API Key missing",
				}));

				context.res.end();
				return false;
			}

			if (process.env.API_KEY !== api_key) {
				context.res.writeHead(HttpStatus.UNAUTHORIZED, app.headers);
				context.res.write(JSON.stringify({
					statusCode: HttpStatus.UNAUTHORIZED,
					message: "Invalid API Key",
				}));

				context.res.end();
				return false;

			}

			return true;
		}

		return true;

	};

};
