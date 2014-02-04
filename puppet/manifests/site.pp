class { 'nginx': }

nginx::resource::vhost { 'www.phaser-prototype.com':
  www_root => '/srv/www/',
}
