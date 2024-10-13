{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    devshell.url = "github:numtide/devshell";
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      imports = [
        inputs.devshell.flakeModule
      ];

      perSystem =
        {
          self',
          system,
          pkgs,
          lib,
          config,
          ...
        }:
        let
          packageJson = builtins.fromJSON (builtins.readFile ./package.json);
          rev = self.shortRev or self.dirtyShortRev or "dirty";
          hash = "sha256-jcMplG+VLHtVr/n2oZ59B+6WNRp/oIQs9HeBxYIkQT4=";
        in
        {
          packages.default = pkgs.buildNpmPackage {
            pname = packageJson.name;
            version = "${packageJson.version}-${rev}";
            src = ./.;
            npmDepsHash = hash;
          };
          devshells.default = {
            commands = [
              {
                package = pkgs.nodejs;
              }
              {
                name = "update_hash";
                help = "Update Hash inside flake.nix to match package-lock.json";
                command = ''
                  hash="$(${lib.getExe pkgs.prefetch-npm-deps} ${./package-lock.json})"
                  echo $hash
                  ${lib.getExe pkgs.gnused} -E -i.prev "s|sha256-[A-Za-z0-9+=/]+|$hash|" flake.nix
                '';
              }
            ];
          };
        };
    };
}
