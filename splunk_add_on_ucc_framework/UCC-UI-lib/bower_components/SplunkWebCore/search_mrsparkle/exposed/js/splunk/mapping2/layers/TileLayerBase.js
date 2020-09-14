define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Point = require("jg/geom/Point");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var NumberUtil = require("jg/utils/NumberUtil");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var LayerBase = require("splunk/mapping2/layers/LayerBase");

    return Class(module.id, LayerBase, function(TileLayerBase, base) {

        // Public Properties

        this.tileSize = new ObservableProperty("tileSize", Number, 256)
            .writeFilter(function(value) {
                return ((value > 0) && (value < Infinity)) ? value : 256;
            });

        this.bufferSize = new ObservableProperty("bufferSize", Number, 0)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.url = new ObservableProperty("url", String, null)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.subdomains = new ObservableArrayProperty("subdomains", String, [ "a", "b", "c" ])
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.minZoom = new ObservableProperty("minZoom", Number, 0)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.maxZoom = new ObservableProperty("maxZoom", Number, Infinity)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : Infinity;
            })
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.wrapX = new ObservableProperty("wrapX", Boolean, true)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.wrapY = new ObservableProperty("wrapY", Boolean, false)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.invertY = new ObservableProperty("invertY", Boolean, false)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.tileOpacity = new ObservableProperty("tileOpacity", Number, 1)
            .writeFilter(function(value) {
                return ((value >= 0) && (value <= Infinity)) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        // Private Properties

        this._tileContainers = null;
        this._activeContainer = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-layers-TileLayerBase");

            this._tileContainers = {};
        };

        // Protected Methods

        this.renderOverride = function(map) {
            var zoom = map.get("zoom");

            var bufferSize = this.getInternal("bufferSize");
            var minZoom = this.getInternal("minZoom");
            var maxZoom = this.getInternal("maxZoom");

            // get viewport bounds in relative coordinates
            var relativeBounds = map.getRelativeBounds();
            var relativeLeft = relativeBounds.x;
            var relativeTop = relativeBounds.y;
            var relativeRight = relativeLeft + relativeBounds.width;
            var relativeBottom = relativeTop + relativeBounds.height;

            // buffer viewport bounds
            relativeLeft -= relativeBounds.width * bufferSize;
            relativeTop -= relativeBounds.height * bufferSize;
            relativeRight += relativeBounds.width * bufferSize;
            relativeBottom += relativeBounds.height * bufferSize;

            // get map bounds in pixels relative to viewport
            var mapTL = map.relativeToViewport(new Point(0, 0));
            var mapBR = map.relativeToViewport(new Point(1, 1));
            var mapLeft = mapTL.x;
            var mapTop = mapTL.y;
            var mapWidth = mapBR.x - mapLeft;
            var mapHeight = mapBR.y - mapTop;

            // snap and clamp tile zoom
            var tileZoom = Math.floor(zoom);
            if ((zoom - tileZoom) > 0.9) {
                tileZoom++;
            }
            tileZoom = NumberUtil.maxMin(tileZoom, maxZoom, minZoom);

            // compute tile scale
            var tileScale = Math.pow(2, tileZoom);

            var tileRequests = this._getTileRequests(relativeLeft, relativeTop, relativeRight, relativeBottom, tileZoom);
            var tileRequest;
            var tileContainers = this._tileContainers;
            var tileContainer;
            var tiles;
            var tile;
            var url;
            var cid;
            var id;
            var x1;
            var x2;
            var y1;
            var y2;
            var i;
            var l;

            // mark all active tiles as inactive
            var activeContainer = this._activeContainer;
            if (activeContainer) {
                tiles = activeContainer.tiles;
                for (id in tiles) {
                    if (ObjectUtil.has(tiles, id)) {
                        tile = tiles[id];
                        tile.isActive = false;
                    }
                }
            }

            // update/create active container
            cid = this._getContainerID(tileZoom);
            activeContainer = tileContainers[cid];
            if (!activeContainer) {
                activeContainer = tileContainers[cid] = new TileContainer(this, cid);
            } else if (activeContainer !== this._activeContainer) {
                activeContainer.display(true);
            }
            this._activeContainer = activeContainer;

            // update/create active tiles
            tiles = activeContainer.tiles;
            for (i = 0, l = tileRequests.length; i < l; i++) {
                tileRequest = tileRequests[i];
                url = this._getTileURL(tileRequest.x, tileRequest.y, tileZoom);
                if (url) {
                    id = this._getTileID(tileRequest.x, tileRequest.y);
                    tile = tiles[id];
                    if (!tile) {
                        tile = tiles[id] = new Tile(activeContainer, id, url);
                        tile.x1 = tileRequest.x / tileScale;
                        tile.x2 = (tileRequest.x + 1) / tileScale;
                        tile.y1 = tileRequest.y / tileScale;
                        tile.y2 = (tileRequest.y + 1) / tileScale;
                    }
                    tile.isActive = true;
                }
            }

            // destroy unloaded tiles
            var unloadedTiles = this._getUnloadedTiles();
            if (unloadedTiles.length > 0) {
                this._destroyTiles(unloadedTiles);
            }

            // position tiles
            for (cid in tileContainers) {
                if (ObjectUtil.has(tileContainers, cid)) {
                    tileContainer = tileContainers[cid];
                    tiles = tileContainer.tiles;
                    for (id in tiles) {
                        if (ObjectUtil.has(tiles, id)) {
                            tile = tiles[id];
                            x1 = Math.round(mapLeft + mapWidth * tile.x1);
                            x2 = Math.round(mapLeft + mapWidth * tile.x2);
                            y1 = Math.round(mapTop + mapHeight * tile.y1);
                            y2 = Math.round(mapTop + mapHeight * tile.y2);
                            tile.position(x1, y1, x2 - x1, y2 - y1);
                        }
                    }
                }
            }

            this._checkTilesLoaded();
        };

        this.createTileContainer = function() {
            throw new Error("Must implement method createTileContainer.");
        };

        this.destroyTileContainer = function(container) {
            throw new Error("Must implement method destroyTileContainer.");
        };

        this.displayTileContainer = function(container, display) {
            throw new Error("Must implement method displayTileContainer.");
        };

        this.createTile = function(container, url, onLoad, onError) {
            throw new Error("Must implement method createTile.");
        };

        this.destroyTile = function(container, tile) {
            throw new Error("Must implement method destroyTile.");
        };

        this.positionTile = function(tile, x, y, width, height) {
            throw new Error("Must implement method positionTile.");
        };

        // Private Methods

        this._checkTilesLoaded = function() {
            var activeContainer = this._activeContainer;
            if (activeContainer) {
                var tiles = activeContainer.tiles;
                var tile;
                for (var id in tiles) {
                    if (ObjectUtil.has(tiles, id)) {
                        tile = tiles[id];
                        if (tile.isActive && !tile.isLoaded) {
                            return;
                        }
                    }
                }

                var inactiveTiles = this._getInactiveTiles(activeContainer);
                if (inactiveTiles.length > 0) {
                    this._destroyTiles(inactiveTiles);
                }
            }

            var inactiveContainers = this._getInactiveContainers();
            if (inactiveContainers.length > 0) {
                this._destroyContainers(inactiveContainers);
            }
        };

        this._getUnloadedTiles = function() {
            var unloadedTiles = [];

            var containers = this._tileContainers;
            var container;
            var cid;
            var tiles;
            var tile;
            var id;
            for (cid in containers) {
                if (ObjectUtil.has(containers, cid)) {
                    container = containers[cid];
                    tiles = container.tiles;
                    for (id in tiles) {
                        if (ObjectUtil.has(tiles, id)) {
                            tile = tiles[id];
                            if (!tile.isActive && !tile.isLoaded) {
                                unloadedTiles.push(tile);
                            }
                        }
                    }
                }
            }

            return unloadedTiles;
        };

        this._getInactiveContainers = function() {
            var inactiveContainers = [];

            var activeContainer = this._activeContainer;
            var containers = this._tileContainers;
            var container;
            for (var id in containers) {
                if (ObjectUtil.has(containers, id)) {
                    container = containers[id];
                    if (container !== activeContainer) {
                        inactiveContainers.push(container);
                    }
                }
            }

            return inactiveContainers;
        };

        this._getInactiveTiles = function(container) {
            var inactiveTiles = [];

            var tiles = container.tiles;
            var tile;
            for (var id in tiles) {
                if (ObjectUtil.has(tiles, id)) {
                    tile = tiles[id];
                    if (!tile.isActive) {
                        inactiveTiles.push(tile);
                    }
                }
            }

            return inactiveTiles;
        };

        this._destroyContainers = function(containersList) {
            var containers = this._tileContainers;
            var container;
            for (var i = 0, l = containersList.length; i < l; i++) {
                container = containersList[i];
                delete containers[container.id];
                container.destroy();
            }
        };

        this._destroyTiles = function(tilesList) {
            var tile;
            for (var i = 0, l = tilesList.length; i < l; i++) {
                tile = tilesList[i];
                delete tile.container.tiles[tile.id];
                tile.destroy();
            }
        };

        this._getTileRequests = function(left, top, right, bottom, zoom) {
            // left, top, right, and bottom are in relative coordinates (0 to 1)
            // zoom is an integer

            var requests = [];

            var scale = Math.pow(2, zoom);

            var xCenter = ((left + right) / 2) * scale - 0.5;
            var yCenter = ((top + bottom) / 2) * scale - 0.5;

            var x1 = Math.floor(left * scale);
            var x2 = Math.ceil(right * scale);
            var y1 = Math.floor(top * scale);
            var y2 = Math.ceil(bottom * scale);

            var dx;
            var dy;

            for (var y = y1; y < y2; y++) {
                dy = y - yCenter;
                dy *= dy;
                for (var x = x1; x < x2; x++) {
                    dx = x - xCenter;
                    dx *= dx;
                    requests.push({ x: x, y: y, dist: Math.sqrt(dx + dy) });
                }
            }

            requests.sort(function(r1, r2) {
                if (r1.dist < r2.dist) {
                    return -1;
                }
                if (r1.dist > r2.dist) {
                    return 1;
                }
                if (r1.y < r2.y) {
                    return -1;
                }
                if (r1.y > r2.y) {
                    return 1;
                }
                if (r1.x < r2.x) {
                    return -1;
                }
                if (r1.x > r2.x) {
                    return 1;
                }
                return 0;
            });

            return requests;
        };

        this._getTileURL = function(x, y, z) {
            // x, y, and z are integers, z is >= 0

            var url = this.getInternal("url");
            if (!url) {
                return null;
            }

            var scale = Math.pow(2, z);
            if (this.getInternal("invertY")) {
                y = scale - y - 1;
            }

            if (!this.getInternal("wrapX") && ((x < 0) || (x >= scale))) {
                return null;
            }

            if (!this.getInternal("wrapY") && ((y < 0) || (y >= scale))) {
                return null;
            }

            x %= scale;
            if (x < 0) {
                x += scale;
            }

            y %= scale;
            if (y < 0) {
                y += scale;
            }

            url = url.replace("{x}", x).replace("{y}", y).replace("{z}", z);

            var subdomain = this._getSubdomain(x, y);
            if (subdomain) {
                url = url.replace("{s}", subdomain);
            }

            return url;
        };

        this._getSubdomain = function(x, y) {
            var subdomains = this.getInternal("subdomains");
            var count = subdomains.length;
            if (count == 0) {
                return null;
            }

            var index = (x + y) % count;
            if (index < 0) {
                index += count;
            }

            return subdomains[index];
        };

        this._getContainerID = function(z) {
            var url = this.getInternal("url");
            var subdomains = this.getInternal("subdomains");
            return "z:" + z + " s:" + subdomains.join(",") + " u:" + (url || "");
        };

        this._getTileID = function(x, y) {
            return x + "," + y;
        };

        // Private Nested Classes

        var TileContainer = Class(Object, function(TileContainer, base) {

            // Public Properties

            this.tileLayer = null;
            this.container = null;
            this.tiles = null;
            this.id = null;

            // Constructor

            this.constructor = function(tileLayer, id) {
                this.tileLayer = tileLayer;
                this.tiles = {};
                this.id = id;

                this.container = tileLayer.createTileContainer();
            };

            // Public Methods

            this.display = function(display) {
                this.tileLayer.displayTileContainer(this.container, display);
            };

            this.destroy = function() {
                var tiles = this.tiles;
                for (var id in tiles) {
                    if (ObjectUtil.has(tiles, id)) {
                        tiles[id].destroy();
                    }
                }

                this.tileLayer.destroyTileContainer(this.container);

                this.tileLayer = null;
                this.container = null;
                this.tiles = null;
            };

        });

        var Tile = Class(Object, function(Tile, base) {

            // Public Properties

            this.tileLayer = null;
            this.container = null;
            this.tile = null;
            this.id = null;
            this.url = null;
            this.x1 = 0;
            this.x2 = 0;
            this.y1 = 0;
            this.y2 = 0;
            this.isActive = false;
            this.isLoaded = false;

            // Constructor

            this.constructor = function(container, id, url) {
                this.tileLayer = container.tileLayer;
                this.container = container;
                this.id = id;
                this.url = url;

                this._tile_loaded = FunctionUtil.bind(this._tile_loaded, this);
                this._tile_error = FunctionUtil.bind(this._tile_error, this);

                this.tile = this.tileLayer.createTile(container.container, url, this._tile_loaded, this._tile_error);
            };

            // Public Methods

            this.position = function(x, y, width, height) {
                this.tileLayer.positionTile(this.tile, x, y, width, height);
            };

            this.destroy = function() {
                this.tileLayer.destroyTile(this.container.container, this.tile);

                this.tileLayer = null;
                this.container = null;
                this.tile = null;
            };

            // Private Methods

            this._tile_loaded = function() {
                if (!this.tile) {
                    return;
                }

                this.isLoaded = true;

                this.tileLayer._checkTilesLoaded();
            };

            this._tile_error = function() {
                if (!this.tile) {
                    return;
                }

                this.isLoaded = true;

                this.tileLayer._checkTilesLoaded();
            };

        });

    });

});
