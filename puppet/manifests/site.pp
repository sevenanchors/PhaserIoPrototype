class { 'nginx': }

nginx::resource::vhost { 'www.phaser_prototype.com':
  www_root => '/srv/www/phaserio',
}
