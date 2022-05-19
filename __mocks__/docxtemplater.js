const MockTemplater = jest.fn().mockImplementation(() => {
	return {
		render: jest.fn(),
		getZip: jest.fn().mockImplementation(() => {
			return {
				generate: jest.fn(),
			};
		}),
	};
});

module.exports = MockTemplater;
