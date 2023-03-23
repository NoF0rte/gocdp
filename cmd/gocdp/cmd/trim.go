package cmd

import (
	"bufio"
	"os"

	"github.com/NoF0rte/gocdp"
	"github.com/spf13/cobra"
)

// trimCmd represents the trim command
var trimCmd = &cobra.Command{
	Use:   "trim files...",
	Args:  cobra.MinimumNArgs(1),
	Short: "Trim/filter results. Currently only supports trimming ffuf results",
	RunE: func(cmd *cobra.Command, args []string) error {
		max, _ := cmd.Flags().GetInt("max")
		redirects, _ := cmd.Flags().GetStringSlice("redirect")
		urls, _ := cmd.Flags().GetStringSlice("url")
		statusCodes, _ := cmd.Flags().GetIntSlice("status")

		var files []string
		for _, arg := range args {
			if arg == "-" {
				scanner := bufio.NewScanner(os.Stdin)
				for scanner.Scan() {
					files = append(files, scanner.Text())
				}
			} else {
				files = append(files, arg)
			}
		}

		var opts []gocdp.TrimOption
		if max > 0 {
			opts = append(opts, gocdp.WithMaxResults(max))
		}

		if len(redirects) > 0 {
			opts = append(opts, gocdp.WithFilterRedirect(redirects...))
		}

		if len(urls) > 0 {
			opts = append(opts, gocdp.WithFilterURL(urls...))
		}

		if len(statusCodes) > 0 {
			opts = append(opts, gocdp.WithFilterStatus(statusCodes...))
		}

		return gocdp.SmartTrimFiles(files, opts)
	},
}

func init() {
	rootCmd.AddCommand(trimCmd)

	trimCmd.Flags().IntP("max", "m", 1000, "Maximum number of results per status code.")
	trimCmd.Flags().StringSliceP("redirect", "r", []string{}, "Regex to filter redirect URLs")
	trimCmd.Flags().StringSliceP("url", "u", []string{}, "Regex to filter URLs")
	trimCmd.Flags().IntSliceP("status", "s", []int{}, "Filter status codes")
}
