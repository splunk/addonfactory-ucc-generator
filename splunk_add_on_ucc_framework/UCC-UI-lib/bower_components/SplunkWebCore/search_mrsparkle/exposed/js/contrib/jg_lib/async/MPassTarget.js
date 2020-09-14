/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Pass = require("./Pass");
	var Class = require("../Class");

	return Class(module.id, function(MPassTarget)
	{

		// Public Events

		this.invalidated = Pass.invalidated;
		this.validated = Pass.validated;

		// Public Properties

		this.isPassTarget = true;

		// Public Methods

		this.invalidate = function(pass)
		{
			pass = Pass.resolve(this, pass);

			pass.invalidate(this);

			return this;
		};

		this.validate = function(pass)
		{
			if (pass != null)
				pass = Pass.resolve(this, pass);

			Pass.validateAll(pass);

			return this;
		};

		this.markValid = function(pass)
		{
			if (pass != null)
			{
				pass = Pass.resolve(this, pass);

				pass.markValid(this);
			}
			else
			{
				Pass.markValid(this);
			}

			return this;
		};

		this.isValid = function(pass)
		{
			if (pass != null)
			{
				pass = Pass.resolve(this, pass);

				return pass.isValid(this);
			}
			else
			{
				return Pass.isValid(this);
			}
		};

		this.isValidating = function(pass)
		{
			if (pass != null)
			{
				pass = Pass.resolve(this, pass);

				return pass.isValidating();
			}
			else
			{
				return Pass.isValidating();
			}
		};

		this.getValidateDepth = function()
		{
			return 0;
		};

	});

});
