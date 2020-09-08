package com.splunk.utils
{

	public interface IReplacementPolicy
	{

		// Methods

		function add(key:*) : void;
		function remove(key:*) : void;
		function hit(key:*) : void;
		function getStale() : *;

	}

}
