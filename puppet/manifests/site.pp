class { 'nginx': }

nginx::resource::vhost { 'www.phaser-prototype.com':
  www_root => '/srv/www/phaser',        
}

$tutorials_config = {
  'sendfile' => 'off',
  'expires'  => 'off',
  'add_header' => 'Cache-Control private',
}

nginx::resource::vhost { 'tutorials.phaser-prototype.com':
  www_root => '/srv/www/tutorials',
  location_cfg_append => $tutorials_config,
}
